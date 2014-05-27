import sys
import os
from pymongo import MongoClient
from slugify import slugify

def link():
    default_dir = os.path.join(os.environ['HOME'], 'hdc', 'lighttpd')
    if len(sys.argv) > 1:
        lighttpd_dir = sys.argv[1]
        if not os.path.isdir(lighttpd_dir):
            print 'This is not a valid dir.'
            return 1
    else:
        lighttpd_dir = default_dir
    apps_dir = os.path.join(lighttpd_dir, 'apps')
    vis_dir = os.path.join(lighttpd_dir, 'visualizations')
    apps_source_dir = os.path.join(__file__, os.pardir, os.pardir, 'apps')
    vis_source_dir = os.path.join(__file__, os.pardir, os.pardir,
                                  'visualizations')
    mongo_client = MongoClient(host='127.0.0.1', port=27017)
    healthdata_db = mongo_client.healthdata
    apps_collection = healthdata_db.apps
    visualizations_collection = healthdata_db.visualizations
    for app in apps_collection.find():
        app_id = str(app['_id'])
        app_link = os.path.abspath(os.path.join(apps_dir, app_id))
        app_source = os.path.abspath(os.path.join(apps_source_dir,
                                                  slugify(app['name'],
                                                          to_lower=True)))
        if not os.path.islink(app_link) and not os.path.exists(app_link)\
            and os.path.exists(app_source):
            print 'Linking %s to %s' % (app_source, app_link)
            os.symlink(app_source, app_link)
    for vis in visualizations_collection.find():
        vis_id = str(vis['_id'])
        vis_link = os.path.abspath(os.path.join(vis_dir, vis_id))
        vis_source = os.path.abspath(os.path.join(vis_source_dir, slugify(
                                                        vis['name'],
                                                        to_lower=True)))
        if not os.path.islink(vis_link) and not os.path.exists(vis_link)\
            and os.path.exists(vis_source):
            print 'Linking %s to %s' % (vis_source, vis_link)
            os.symlink(vis_source, vis_link)

if __name__ == '__main__':
    sys.exit(link())