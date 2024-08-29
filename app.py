from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pytz

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:00436408428@localhost/seguimiento_pieza'
db = SQLAlchemy(app)

class Pieza(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    codigo = db.Column(db.String(255), nullable=False, unique=True)
    puesto_actual = db.Column(db.String(50))
    entrada = db.Column(db.DateTime)
    salida = db.Column(db.DateTime)
    operario_entrada = db.Column(db.String(50))
    operario_salida = db.Column(db.String(50))
    operario = db.Column(db.String(50))  # Asegúrate de utilizar este campo correctamente si es necesario
    acotacion = db.Column(db.Text)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_operarios_puestos')
def get_operarios_puestos():
    data = {
        "operarios": ['Jorge', 'Christian', 'Ricardo', 'Leonel', 'Carlos', 'Guido', 'Guillermo', 'Franco', 'Juan'],
        "puestos": ['Fresa', 'Torno', 'Rectificado', 'Centro de Mecanizado', 'Tratamiento Térmico']
    }
    return jsonify(data) 

@app.route('/registrar_entrada', methods=['POST'])
def registrar_entrada():
    data = request.get_json()
    codigo = data.get('codigo')
    operario = data.get('operario')
    puesto = data.get('puesto')

    pieza = Pieza.query.filter_by(codigo=codigo).first()

    if pieza:
        pieza.puesto_actual = puesto
        pieza.entrada = datetime.now(pytz.timezone('America/Argentina/Buenos_Aires'))
        pieza.operario_entrada = operario
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Pieza no encontrada'}), 404

@app.route('/registrar_salida', methods=['POST'])
def registrar_salida():
    data = request.json
    codigo = data.get('codigo')
    operario = data.get('operario')
    puesto = data.get('puesto')

    pieza = Pieza.query.filter_by(codigo=codigo).first()

    if pieza:
        pieza.puesto_actual = puesto
        pieza.salida = datetime.now(pytz.timezone('America/Argentina/Buenos_Aires'))
        pieza.operario_salida = operario
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Pieza no encontrada'}), 404

@app.route('/lote_terminado', methods=['POST'])
def marcar_lote_terminado():
    data = request.json
    codigo = data.get('codigo')

    pieza = Pieza.query.filter_by(codigo=codigo).first()

    if pieza:
        # Suponiendo que el lote está terminado, se puede agregar lógica adicional si es necesario
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Pieza no encontrada'}), 404

@app.route('/obtener_piezas', methods=['GET'])
def obtener_piezas():
    try:
        piezas = Pieza.query.all()
        piezas_data = [{
            'codigo': pieza.codigo,
            'puesto_actual': pieza.puesto_actual,
            'entrada': pieza.entrada.isoformat() if pieza.entrada else '',
            'salida': pieza.salida.isoformat() if pieza.salida else '',
            'operario_entrada': pieza.operario_entrada,
            'operario_salida': pieza.operario_salida,
            'acotacion': pieza.acotacion
        } for pieza in piezas]
        return jsonify(piezas_data), 200
    except Exception as e:
        # Imprime el error en el servidor para diagnóstico
        print(f"Error al obtener las piezas: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/agregar_observacion', methods=['POST'])
def agregar_observacion():
    data = request.json
    pieza_id = data.get('id')
    observacion = data.get('observacion')

    pieza = Pieza.query.get(pieza_id)

    if pieza:
        pieza.acotacion = observacion
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Pieza no encontrada'}), 404

@app.route('/eliminar_pieza', methods=['POST'])
def eliminar_pieza():
    data = request.json
    pieza_id = data.get('id')

    pieza = Pieza.query.get(pieza_id)

    if pieza:
        db.session.delete(pieza)
        db.session.commit()
        return jsonify({'status': 'success'}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Pieza no encontrada'}), 404

import logging
logging.basicConfig(level=logging.DEBUG)


if __name__ == '__main__':
    app.run(debug=True)










