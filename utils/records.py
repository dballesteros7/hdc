import datetime

import pymongo

connection_cache = None

def mongo_connect(func):
    def wrapper(*args, **kwargs):
        global connection_cache
        if connection_cache is None:
            connection_cache = pymongo.MongoClient(host='127.0.0.1',
                                                   port=27017)
        return func(connection_cache, *args, **kwargs)
    return wrapper

@mongo_connect
def create_record(conn, name, description, data,
                  owner='Test User 1', creator=None,app='Text'):
    if creator is None:
        creator = owner
    owner_id = conn.healthdata.users.find_one({'name' : owner})['_id']
    creator_id = conn.healthdata.users.find_one({'name' : creator})['_id']
    app_id = conn.healthdata.apps.find_one({'name' : app})['_id']
    records = conn.healthdata.records
    record_id = records.insert({'app' : app_id,
                                'name' : name,
                                'description' : description,
                                'data' : data,
                                'created' : datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                'owner' : owner_id,
                                'creator' : creator_id})
    print record_id