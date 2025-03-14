using Microsoft.Extensions.Logging;
using SkiaSharp;
namespace AuraHospital;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp<App>()
			.UseSkiaSharp()
			.ConfigureFonts(fonts =>
			{
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
				fonts.AddFont("latobold.TTF" , "bold");
				fonts.AddFont("latoregular.TTF", "medium");
				fonts.AddFont("FontAwesomeSolid.otf", "AwesomeSolid");

			});

#if DEBUG
		builder.Logging.AddDebug();
#endif

		return builder.Build();
	}
}
