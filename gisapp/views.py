from django.shortcuts import render, redirect

from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
# from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages

from django.http import HttpResponse


import json
from django.conf import settings




# Create your views here.
@login_required(login_url='login')
def home_page(request):


	return render(request, "gisapp/home.html", {'Title': "Home Page"}) #"image_form": ImageForm

def login_view(request):
	if request.user.is_authenticated:
		return redirect('home')
	else:
		
		if request.method == 'POST':
			username = request.POST.get('username')
			password =request.POST.get('password')
			user = authenticate(request, username=username, password=password)
			
			if user is not None:
				login(request, user)
				return redirect('home')
			else:
				messages.info(request, 'Username OR password is incorrect')

		context = {}
		return render(request, 'gisapp/login.html', context)

# logout
def logout_view(request):
	
	if request.user.is_authenticated:
		logout(request)
		return render(request,'gisapp/logout.html')
		
	else:
		return render(request, 'gisapp/login.html')