FROM ubuntu:17.10
RUN apt-get update -y
RUN apt-get install -y apt-utils
RUN apt-get install -y git
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN npm install electron-forge -g
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:alexlarsson/flatpak
RUN apt-get install -y flatpak-builder
RUN apt-get install -y fakeroot
RUN apt-get install -y zip
RUN apt-get install -y unzip
