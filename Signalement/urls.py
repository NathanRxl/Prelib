from django.conf.urls import patterns, url
import views.py

urlpatterns = patterns('',
                       url(r'^$',views.create_report,name='create_report'),
                       )
