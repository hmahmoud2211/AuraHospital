using AuraHospital.Login;
namespace AuraHospital
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();
            MainPage = new Loginview(); 
        }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            return new Window(new AppShell());
        }
    }
}