import django.http
from Signalement.models import Global

#Insert a row in the table Global with an instance of global
def create_report(request):
    if request.method == 'GET':
        pass
    elif request.method == 'POST':
        request.POST.get(name,loss)#get the name of the station and
        #the number of broken bikes
        report = Global(station_name = name, station_loss = loss)
        #create a row and save it
        report.save()
        
        


    
    
    
