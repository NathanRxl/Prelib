from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'django_prelib.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^report/', include('report.urls')),
    url(r'^admin/', include(admin.site.urls)),
)