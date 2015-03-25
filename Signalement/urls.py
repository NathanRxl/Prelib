from django.conf.urls import patterns, url


urlpatterns = patterns('Signalement.views',
                       #créé le signalement
        url(r'^signalement/(?P<id_station>\d{5})/(?P<loss>\d{1,})$','create_report'),
        )
