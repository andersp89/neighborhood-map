#!/usr/bin/python3

import requests


# Get basic LinkedIn profile data
parameters = 'first-name,email-address,picture-url'
uri = 'https://api.linkedin.com/v1/people/~:(%s)?format=json' \
	% (parameters)
headers = {}
headers['Authorization'] = 'Bearer ' + login_session['access_token']
get_profile = requests.get(uri, headers=headers).json()

try:
	login_session['name'] = get_profile['firstName']
	login_session['email'] = get_profile['emailAddress']
	login_session['picture'] = get_profile['pictureUrl']
except:
	response = make_response(json.dumps('''Failed to get retrieve LinkedIn
		 profile data.'''), 401)
	response.headers['Content-Type'] = 'application/json'
	return response