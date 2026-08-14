from django import forms
from django.contrib.auth.forms import AuthenticationForm

from .models import Coupon, Product


class StoreLoginForm(AuthenticationForm):
    username = forms.CharField(
        max_length=64,
        widget=forms.TextInput(attrs={"class": "form-control", "autocomplete": "username"}),
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={"class": "form-control", "autocomplete": "current-password"}),
    )


class CouponForm(forms.ModelForm):
    class Meta:
        model = Coupon
        fields = ("code", "discount_percent")
        widgets = {
            "code": forms.TextInput(attrs={"class": "form-control"}),
            "discount_percent": forms.NumberInput(attrs={"class": "form-control", "min": 1, "max": 100}),
        }


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = (
            "name",
            "price",
            "category",
            "image",
            "description",
            "stars",
            "old_price",
            "discount",
            "product_date",
        )
        widgets = {
            "name": forms.TextInput(attrs={"class": "form-control"}),
            "price": forms.NumberInput(attrs={"class": "form-control", "step": "0.01", "min": 0}),
            "category": forms.TextInput(attrs={"class": "form-control"}),
            "image": forms.ClearableFileInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 3}),
            "stars": forms.NumberInput(attrs={"class": "form-control", "step": "0.1", "min": 0, "max": 5}),
            "old_price": forms.NumberInput(attrs={"class": "form-control", "step": "0.01"}),
            "discount": forms.NumberInput(attrs={"class": "form-control", "min": 0, "max": 100}),
            "product_date": forms.DateInput(attrs={"class": "form-control", "type": "date"}),
        }
