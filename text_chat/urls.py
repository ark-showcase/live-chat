from django.urls import path

from .views import lobby1, lobby2

urlpatterns = [
    path('person1/',lobby1),
    path('person2/',lobby2)
]