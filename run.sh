docker-compose rm -f
docker-compose pull;
docker-compose up -d --force-recreate;
cd ..;
echo;
echo 'fluree-notebook  -->  http://localhost:5180';