import cv2
import os

image_folder = 'im1'
video_name = 'video1_full.avi'

images = []

#images = [img for img in os.listdir(image_folder) if img.endswith(".png")]

for i in range(0,1000,15):
    images.append(str(i)+'.png')


frame = cv2.imread(os.path.join(image_folder, images[0]))
height, width, layers = frame.shape

video = cv2.VideoWriter(video_name, 0, 5, (width,height))

for image in images:
    video.write(cv2.imread(os.path.join(image_folder, image)))

cv2.destroyAllWindows()
video.release()