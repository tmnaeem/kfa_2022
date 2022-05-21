from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os


def save_image_to_media(data, image_file):
    ''' Image Saving Function '''
    path = os.path.join(settings.MEDIA_ROOT, 'teams', data['SECRET_KEY'], data['TEAM'], 'logo')
    save_path = os.path.join('media', 'teams', data['SECRET_KEY'], data['TEAM'], 'logo')
                
    if os.path.exists(os.path.join(path, image_file.name)):
        os.remove(os.path.join(path, image_file.name))
    
    fs = FileSystemStorage(path)
    fs.save(image_file.name, image_file)

    return save_path