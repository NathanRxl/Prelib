from django.db import models
from django.utils import timezone
from datetime import datetime

class Report(models.Model):
    report_date = models.DateTimeField('Date of report', default=timezone.now())
    station_id = models.IntegerField('Station id')
    broken_bikes = models.IntegerField('Number of broken bikes')

    def __str__(self):
        columns = [datetime.strftime(self.report_date, "%d\%m\%Y %X"), str(self.station_id), str(self.broken_bikes)]
        return "(" + ", ".join(columns) + ")"