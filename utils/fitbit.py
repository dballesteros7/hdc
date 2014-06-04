from datetime import date, timedelta
import json

from requests_oauthlib.oauth1_session import OAuth1Session
from records import create_record, assign_record_to_space

NO_TOKEN = False

client_key = r'6118464cd4d64cc49f83f9346f8e0bab'
client_secret = r'277eb8606435444c8a3ed66938aaed41'

if NO_TOKEN:
    request_token_url = 'https://api.fitbit.com/oauth/request_token'
    fitbit = OAuth1Session(client_key, client_secret=client_secret)
    fetch_response = fitbit.fetch_request_token(request_token_url)
    resource_owner_key = fetch_response.get('oauth_token')
    resource_owner_secret = fetch_response.get('oauth_token_secret')

    base_authorization_url = 'https://api.fitbit.com/oauth/authorize'
    authorization_url = fitbit.authorization_url(base_authorization_url)
    print 'Please go here and authorize,', authorization_url
    verifier = raw_input('Paste the verifier here: ')

    access_token_url = 'https://api.fitbit.com/oauth/access_token'
    fitbit = OAuth1Session(client_key,
                          client_secret=client_secret,
                          resource_owner_key=resource_owner_key,
                          resource_owner_secret=resource_owner_secret,
                          verifier=verifier)
    oauth_tokens = fitbit.fetch_access_token(access_token_url)
    resource_owner_key = oauth_tokens.get('oauth_token')
    resource_owner_secret = oauth_tokens.get('oauth_token_secret')
    print resource_owner_key
    print resource_owner_secret
else:
    resource_owner_key = '7cc28955cfe9536cfd25516a7159bd34'
    resource_owner_secret = '859639d185b7273c1487aace7a3f9a36'
    fitbit = OAuth1Session(client_key,
                           client_secret=client_secret,
                           resource_owner_key=resource_owner_key,
                           resource_owner_secret=resource_owner_secret)


def retrieve_store_fitbit_weight_records():
    current_date = date(2014,month=6,day=3)
    response = fitbit.get('https://api.fitbit.com/1/user/-/body/log/weight/date/%s.json' % (current_date.strftime('%Y-%m-%d')))
    record = response.json()
    record_id = create_record(name = 'Weight data for %s' % current_date.strftime('%Y-%m-%d'), description = 'Weight data', data = record)
    assign_record_to_space(record_id, 'Weight-dev')

if __name__ == '__main__':
    retrieve_store_fitbit_weight_records()