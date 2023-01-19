import joi from 'joi';

export const uploadContribSchema = joi.object({
  name: joi.string().alphanum().max(40).required(),
  circuit: joi.string().required(),
  token: joi.string().required(),
});

export const uploadBeaconSchema = joi.object({
  circuit: joi.string().required(),
});
