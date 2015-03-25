from django.shortcuts import render
from django.http import HttpResponse
from django.utils import timezone
from report.models import Report

def index(request):
    latest_reports = Report.objects.order_by('-report_date')[:4]
    output = " ".join(str(report) for report in latest_reports)
    return HttpResponse(output)

def add_report(request, id_station, broken_bikes):
    new_report = Report(report_date=timezone.now(), id_station=id_station, broken_bikes=broken_bikes)
    new_report.save()
    if(int(broken_bikes)>=2):
        return HttpResponse("Thanks for reporting broken bikes. We noted that at the moment, %s bikes are broken at station #%s."
                            % (broken_bikes, id_station))
    elif(int(broken_bikes)==1):
        return HttpResponse("Thanks for reporting broken bikes. We noted that at the moment, 1 bike is broken at station #%s."
                            % id_station)
    else:
        return HttpResponse("Thanks for reporting broken bikes. We noted that at the moment, no bikes are broken at station #%s."
                            % id_station)



