from django.urls import path
from . import consumers


websocket_urlpatterns = [
    path('person1/', consumers.ChatConsumer.as_asgi()),
    path('person2/', consumers.ChatConsumer.as_asgi()),
]