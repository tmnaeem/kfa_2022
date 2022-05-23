from django.core.files.storage import FileSystemStorage
from django.conf import settings
import os


def save_image_to_media(image_file, path):
    ''' Image Saving Function '''       

    if os.path.exists(os.path.join(path, image_file.name)):
        os.remove(os.path.join(path, image_file.name))
    
    fs = FileSystemStorage(path)
    fs.save(image_file.name, image_file)