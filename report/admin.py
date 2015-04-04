from django.contrib import admin
from report.models import Report

class ReportAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Report information', {'fields': ['report_date', 'station_id', 'broken_bikes']}),
        ]
    list_display = ('report_date', 'station_id', 'broken_bikes')
    list_filter = ['station_id']

admin.site.register(Report, ReportAdmin)
