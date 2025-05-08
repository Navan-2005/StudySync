# import cv2
# from deepface import DeepFace
# from fastapi import FastAPI



# app = FastAPI()
# @app.post("/emo")
# def root():
# #  faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

#  cap = cv2.VideoCapture(1)

#  if not cap.isOpened():
#     cap = cv2.VideoCapture(0)
#  if not cap.isOpened():
#     raise IOError("Cannot open webcam")

#  while True:
#     ret, frame = cap.read()
#     result = DeepFace.analyze(frame , actions=['emotion'],enforce_detection=False)
#     resultSend = result[0]['dominant_emotion']
#     print(result[0]['dominant_emotion'])

#     # gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

#     # faces = faceCascade.detectMultiScale(gray, 1.1, 4)

#     # for (x, y, w, h) in faces:
#     #     cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

#     # font = cv2.FONT_HERSHEY_SIMPLEX
#     # cv2.putText(frame, 
#     #             result[0]['dominant_emotion'],
#     #             (50, 50),
#     #             font, 1, 
#     #             (0, 0, 255),
#     #             2,
#     #              cv2.LINE_4)

#     cv2.imshow('frame', frame)
#     if cv2.waitKey(2) & 0xFF == ord('q'):
#         break

#  cap.release()
#  cv2.destroyAllWindows()





#  return {"message": resultSend}


import cv2
from deepface import DeepFace
from fastapi import FastAPI

app = FastAPI()

@app.post("/emo")
def detect_emotion():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise IOError("Cannot open webcam")

    ret, frame = cap.read()
    cap.release()

    if not ret:
        return {"error": "Failed to capture frame"}

    try:
        result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        dominant_emotion = result[0]['dominant_emotion']
        return {"dominant_emotion": dominant_emotion}
    except Exception as e:
        return {"error": str(e)}