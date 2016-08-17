UPDATE threads SET score =
  0.7 * (updatetime - 1.45E12) +
  0.3 * (createtime - 1.45E12) +
  (
    coalesce(180 * atan((counts->>'upvote')::integer), 0) +
    coalesce(90 * atan((counts->>'children')::integer / 5), 0) +
    coalesce(150 * atan((counts->>'follower')::integer / 3), 0)
  ) * 60000 * 2 / pi();
