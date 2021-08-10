from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User


class CustomUserAdmin(UserAdmin):
    list_display = ('username','date_joined','last_login', 'is_staff') 
    search_fields = ('username',)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)