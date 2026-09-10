import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('opportunities', '0001_initial'),
        ('skills', '0002_industry_assessments'),
    ]

    operations = [
        migrations.AddField(
            model_name='internship',
            name='required_assessment',
            field=models.ForeignKey(blank=True, help_text='If set, a student must pass this assessment before they can apply.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='internships', to='skills.industryassessment'),
        ),
        migrations.AddField(
            model_name='job',
            name='required_assessment',
            field=models.ForeignKey(blank=True, help_text='If set, a student must pass this assessment before they can apply.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='jobs', to='skills.industryassessment'),
        ),
    ]
