exports.up = function(knex) {
  return knex.schema.createTable('api_keys', function(table) {
    table.increments('id').primary();  // Auto-incrementing ID
    table.string('api_key', 64).unique().notNullable();  // API key (unique)
    table.string('hmac_secret', 128).notNullable();  // HMAC secret for signing
    table.timestamp('created_at').defaultTo(knex.fn.now());  // When the key was created
    table.timestamp('updated_at').defaultTo(knex.fn.now());  // When the key was last rotated
    table.boolean('is_active').defaultTo(true);  // Active or inactive key status
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('api_keys');  // Rollback (drop the table)
};
