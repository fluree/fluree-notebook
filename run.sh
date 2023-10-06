docker-compose rm -f
docker-compose pull;
docker-compose up -d --force-recreate;
cd ..;
echo app is running!;
echo;
echo 'fluree-notebook  -->  http://localhost:5173';
echo '    node-server  -->  http://localhost:5001';
echo ' fluree-swagger  -->  http://localhost:58090';
echo;