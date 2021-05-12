/* Por cada saverRule(indica si se debe salvar el valor en la bd o no) que
 se crea en emqx(donde no hay como definir varios usuarios), vamos a salvarla 
 en la base mongo, adicionandole el userId, dId(identificacion de dispositivo)*/

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const saverRuleSchema = new Schema({
    userId: {type: String, required: [true]},//no lo da emqx 
    dId: { type: String, required: [true] },//Device Id al que pertenece la saver rule
    emqxRuleId: { type: String, required: [true] },//Id que emqx dio a esa regla
    status:  { type: Boolean, required: [true] }  //activa o desactiva el salvar datos
});

const SaverRule = mongoose.model('SaverRule', saverRuleSchema);

export default SaverRule;