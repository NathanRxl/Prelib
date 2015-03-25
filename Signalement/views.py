from django.shortcuts import render
from django.shortcuts import 

from django.http import HttpResponse, Http404
import HttpRequest
from Signalement.models import Global

#Insert a row in the table Global with an instance of global
def create_report(request,id_station,loss):
    if request.method == 'GET':
        pass
    elif request.method == 'POST':
        report = Global(station_id = id_station, station_loss = loss)
        report.save()
        return HttpResponse("Votre report a bien été pris en compte. Merci d\'utiliser Prelib\'")

                    
                            
                            
        
