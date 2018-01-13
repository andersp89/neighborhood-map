#!/usr/bin/python3

# import argparse
import json
from pprint import pprint
import requests
import sys
import urllib
from http.server import BaseHTTPRequestHandler, HTTPServer

from urllib.error import HTTPError
from urllib.parse import quote
from urllib.parse import urlencode

from flask import Flask, jsonify, request
from flask_cors import CORS

# from flask.ext.cors import cross_origin

app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# Secret Yelp API Key
API_KEY = '16LPrNhV3ioZkBILlg6OV4A3lJOK_RqSMWJJ4_3SWsZWFnPgvJ-um207sFyqXCMr9cDqwY4jIPRfoQgCOr6jw04MF2PGJvJrq5WIJYsLtqG4z7iSFnpvmCXOATNSWnYx'

# API constants
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.
SEARCH_LIMIT = 1

# Request helper function
def request_yelp(host, path, api_key, url_params=None):
    """Given your API_KEY, send a GET request to the API.

    Args:
        host (str): API_HOST
        path (str): SEARCH_PATH
        API_KEY (str): Your API Key.
        url_params (dict): An optional set of query parameters in the request.

    Returns:
        dict: The JSON response from the request.

    Raises:
        HTTPError: An error occurs from the HTTP request.
    """
    url_params = url_params or {}
    url = '{0}{1}'.format(host, quote(path.encode('utf8')))
    headers = {
        'Authorization': 'Bearer %s' % api_key,
    }

    response = requests.request('GET', url, headers=headers, params=url_params)
    return response.json()

# Search for businesses
def search(api_key, term, location):
    """Query the Search API by a search term and location.

    Args:
        term (str): The search term passed to the API.
        location (str): The search location passed to the API.

    Returns:
        dict: The JSON response from the request.
    """

    url_params = {
        'term': term.replace(' ', '+'),
        'location': location.replace(' ', '+'),
        'limit': SEARCH_LIMIT
    }
    return request_yelp(API_HOST, SEARCH_PATH, api_key, url_params=url_params)

# Get information of business
def get_business(api_key, business_id):
    """Query the Business API by a business ID.

    Args:
        business_id (str): The ID of the business to query.

    Returns:
        dict: The JSON response from the request.
    """
    business_path = BUSINESS_PATH + business_id
    return request_yelp(API_HOST, business_path, api_key)

# Make query to Yelp API
def query_api(term, location):
    """Queries the API by the input values from the user.

    Args:
        term (str): The search term to query.
        location (str): The location of the business to query.
    """
    response = search(API_KEY, term, location)
    businesses = response.get('businesses')

    if not businesses:
        return (u'No businesses for {0} in {1} found.'.format(term, location))

    business_id = businesses[0]['id']
    response = get_business(API_KEY, business_id)
    return response


@app.route('/yelp-search')
def get_yelp_business_information():
    search_term = request.args.get('search_term', type=str)
    search_location = request.args.get('search_location', type=str)

    if search_term and search_location:
        try:
            business = query_api(search_term, search_location)
        except HTTPError as error:
            sys.exit(
                'Encountered HTTP error {0} on {1}:\n {2}\nAbort program.'.format(
                    error.code,
                    error.url,
                    error.read(),
                )
            )     
    else: 
        return jsonify("Please provide both arguments 'search_term' and 'search_location'")
    
    return jsonify(business)

if __name__ == '__main__':
    app.secret_key = "secret_in_production123" # Secret!
    app.debug = True
    app.run(host='0.0.0.0', port=8080)
