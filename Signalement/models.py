from django.db import models

class Global(models.Model):
    station_id = models.IntegerField(default=0)
    report_date = models.DateTimeField(auto_now_add=True,auto_now=False,
                                       verbose_name='report date')
    station_loss = models.IntegerField('Broken bikes',default=0)
    def __str__(self):
        return self.station_id

    
    
    
