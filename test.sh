curl -X POST -H "Content-Type: application/json" -d '{"host": "example.com", "visitorId": "user-123"}' http://localhost:3000/api/track/unique
curl -X GET http://localhost:3000/api/analytics/unique/example.com
curl -X GET http://localhost:3000/api/analytics/track/example.com/2025-08-17