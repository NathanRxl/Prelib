from django.db import models
from django.utils import timezone
from datetime import datetime

class Report(models.Model):
    report_date = models.DateTimeField('Date of report', default=timezone.now())
    id_station = models.IntegerField('Station id')
    broken_bikes = models.IntegerField(r'Number of broken bikes')

    def __str__(self):
        return "(" + datetime.strftime(self.report_date, "%d\%m\%Y %X") + ", " + str(self.id_station) + ", " + str(self.broken_bikes) + ")"
