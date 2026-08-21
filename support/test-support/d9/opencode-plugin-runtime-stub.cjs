const tool = (value) => value;
tool.schema = { object: () => ({ optional: () => ({}) }), string: () => ({ optional: () => ({}) }), array: () => ({}) };
module.exports = { tool };
