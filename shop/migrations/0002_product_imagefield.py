from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("shop", "0001_initial"),
    ]

    operations = [
        migrations.RenameField(
            model_name="product",
            old_name="image",
            new_name="image_path",
        ),
        migrations.AlterField(
            model_name="product",
            name="image_path",
            field=models.CharField(blank=True, default="", max_length=512),
        ),
        migrations.AddField(
            model_name="product",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to="products/"),
        ),
    ]
