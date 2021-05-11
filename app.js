const debug = require('debug')('app:inicio');
const express= require('express');
const Joi = require('joi');
const morgan = require('morgan');
const config = require('config');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// configuracion de entorno
console.log('Aplicaion' + config.get('nombre'));
console.log('DB' + config.get('configDB.host'));


// uso de midleware externo 
if(app.get('env') === 'development'){
    app.use(morgan('tiny'))
    //console.log('morgan habilitado');
    debug('morgan habilitado');
}
debug('debuf db');



// midleware  interno
//app.use(function(req,res,next) {
//    console.log('midleware');
 //   next();
//})

const usuarios = [{id:1,nombre:'alex'},{id:2,nombre:'adri'}];

app.get('/',(req,res) =>{
    res.send(usuarios);
});

app.get('/api/usuario/:id',(req,res) =>{
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario  = validaUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('usuario no existe');
        return;
    }
});

app.post('/api/usuario',(req,res) =>{

    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    }); 

    const {error,value} = schema.validate({ nombre: req.body.nombre});
    if(!error){
        const usuario = {
            id:usuarios.length+1,
            nombre:value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
    }

});

app.put('/api/usuario/:id',(req,res) =>{
    // buscar id
    //let usuario = usuarios.find(u => u.id === parseInt(req.params.id));
    let usuario  = validaUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('susario no existe');
        return;
    } 

    // valida campo nombre
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    }); 
    const {error,value} = validaCampos(req.body.nombre);
    if(error){
        const mensaje = error.details[0].message;
        res.status(400).send(mensaje);
        return;
    }
            // guarda nuevo valor
        usuario.nombre = value.nombre;
        res.send(usuario);

});

app.delete('/api/usuario/:id',(req,res) =>{
    let usuario  = validaUsuario(req.params.id);
    if(!usuario){
        res.status(404).send('susario no existe');
        return;
    } 

    const index = usuarios.indexOf(usuario);
    usuarios.splice(index,1);

    res.send(usuario);

});

function validaUsuario(id) {
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validaCampos(nom) {
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    }); 
    return (schema.validate({ nombre:nom}));
}

app.listen(3000,()=>{
    console.log('escucha puerto 3000');
})