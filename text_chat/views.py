from django.shortcuts import render

# Create your views here.

def lobby1(request):

    return render(request, 'messages1.html')

def lobby2(request):
    return render(request, 'messages2.html')