from allauth.account.forms import LoginForm
from django import forms

class MyCustomLoginForm(LoginForm):
   def __init__(self, *args, **kwargs):
        super(MyCustomLoginForm, self).__init__(*args, **kwargs)
        
        self.fields['login'].label = ''
        self.fields['login'].widget = forms.TextInput(attrs={'type': 'username', 'class': 'form-control'})
        
        self.fields['password'].label = ''
        self.fields['password'].widget = forms.PasswordInput(attrs={'class': 'form-control'})
        
      #   self.fields['remember'].label = ''
      #   self.fields['remember'].widget = forms.BooleanField()