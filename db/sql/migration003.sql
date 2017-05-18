CREATE FUNCTION delete_expired_messages() RETURNS void AS $$
  DELETE FROM messages WHERE created + interval '1s' * ttl_secs < now();
$$ LANGUAGE SQL VOLATILE;
