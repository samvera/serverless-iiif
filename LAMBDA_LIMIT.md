# Note Regarding Lambda Payload Limits

API Gateway Lambda functions have a ~6MB limit for both incoming
and outgoing payloads. *This limit should never affect tile requests*, 
but may affect image transformation results greater than about 6 
megapixels (depending on compression and quality settings).

## Workaround

In the `IIIFLambda.directResponse()` function, if the base64 
encoded response is larger than about `5*1024*1024` bytes, 
we should:

1. Write the **unencoded** `result.body` to an S3 bucket designated 
   for IIIF caching
2. Generate a signed GET URL for that S3 object
3. Respond with a 303 (See Other) redirect to that URL instead of
   returning the payload directly

The IIIF caching bucket should have a lifecycle policy that expires
cached responses after 1 day to prevent clutter.

Since this is a simple demo, we're going to pretend the 6MB limit
doesn't exist. As a result, large responses will result in a
500 Server Error.