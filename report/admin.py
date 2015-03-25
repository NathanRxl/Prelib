from django.contrib import admin
from report.models import Report

class ReportAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Report information', {'fields': ['report_date', 'id_station', 'broken_bikes']}),
        ]
    list_display = ('report_date', 'id_station', 'broken_bikes')
    list_filter = ['id_station']

admin.site.register(Report, ReportAdmin)
