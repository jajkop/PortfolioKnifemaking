FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY NozeStrona.Api/NozeStrona.Api.csproj NozeStrona.Api/
RUN dotnet restore NozeStrona.Api/NozeStrona.Api.csproj
COPY NozeStrona.Api/ NozeStrona.Api/
RUN dotnet publish NozeStrona.Api/NozeStrona.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
RUN mkdir -p /app/uploads
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Docker
EXPOSE 8080
VOLUME ["/app/uploads"]
ENTRYPOINT ["dotnet", "NozeStrona.Api.dll"]
