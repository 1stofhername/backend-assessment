const api = require('../app');

test('string with a single number should result in the number itself', () => {
    expect(api.fetchPosts('tech').length).toBe(28);
  });