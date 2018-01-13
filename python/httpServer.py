#!/usr/bin/python3

# Look at official yelp github python doc! as it comes from there!

from __future__ import print_function

import argparse
import json
import pprint
import requests
import sys
import urllib
from http.server import BaseHTTPRequestHandler, HTTPServer

from urllib.error import HTTPError
from urllib.parse import quote
from urllib.parse import urlencode

# Secret Yelp API Key
API_KEY = '16LPrNhV3ioZkBILlg6OV4A3lJOK_RqSMWJJ4_3SWsZWFnPgvJ-um207sFyqXCMr9cDqwY4jIPRfoQgCOr6jw04MF2PGJvJrq5WIJYsLtqG4z7iSFnpvmCXOATNSWnYx'


# API constants
API_HOST = 'https://api.yelp.com'
SEARCH_PATH = '/v3/businesses/search'
BUSINESS_PATH = '/v3/businesses/'  # Business ID will come after slash.


# Defaults for our simple example.
# TODO: To be connected with AJAX call from frontend.
DEFAULT_TERM = 'Aros'
DEFAULT_LOCATION = 'Aarhus, DK'
SEARCH_LIMIT = 1

# Request helper function
def request(host, path, api_key, url_params=None):
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

    print(u'Querying {0} ...'.format(url))

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
    return request(API_HOST, SEARCH_PATH, api_key, url_params=url_params)

# Get information of business
def get_business(api_key, business_id):
    """Query the Business API by a business ID.

    Args:
        business_id (str): The ID of the business to query.

    Returns:
        dict: The JSON response from the request.
    """
    business_path = BUSINESS_PATH + business_id

    return request(API_HOST, business_path, api_key)

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

    '''
    print(u'{0} businesses found, querying business info ' \
        'for the top result "{1}" ...'.format(
            len(businesses), business_id))
    '''
    
    response = get_business(API_KEY, business_id)

    return response
    # print(u'Result for business "{0}" found:'.format(business_id))
    # pprint.pprint(response, indent=2)

    # Return JSON

# Simple HTTP Server for development only
class WebServerHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path.endswith("/yelp-api"):

            # restaurants = session.query(Restaurant).all()
            output = ""
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            output += "<html><body>"
            output += "Monkey!"
            output += "</body></html>"
            self.wfile.write(output.encode())
            return
        else:
            self.send_error(404, 'File hehe Not Found: %s' % self.path)

def main():
    
    '''
    parser = argparse.ArgumentParser()

    parser.add_argument('-q', '--term', dest='term', default=DEFAULT_TERM,
                        type=str, help='Search term (default: %(default)s)')
    parser.add_argument('-l', '--location', dest='location',
                        default=DEFAULT_LOCATION, type=str,
                        help='Search location (default: %(default)s)')

    input_values = parser.parse_args()
    '''

    try:
        port = 8080
        server = HTTPServer(('', port), WebServerHandler)
        print ("Web server running on port %s" % port)
        server.serve_forever()
    except:
        print (" entered, stopped web server...")
        server.socket.close()


if __name__ == '__main__':
    main()
