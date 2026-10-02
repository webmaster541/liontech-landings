import os
import re

html_path = r'c:\Users\diseño web\Desktop\Landing HTML\pages\mechanic-ve.html'
with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

products = {
    'MECH--197': {
        'title': 'DISPENSADOR SD150A DE 150ML',
        'desc': 'Dispensador de solventes, para Alcohol Isopropílico o líquidos en general. Práctico y seguro. Núcleo de Aluminio.',
        'uses': ['Almacenar líquidos nocivos', 'Alcohol Isopropílico', 'Talleres técnicos']
    },
    'MECH--199': {
        'title': 'CUCHILLAS PARA BISTURÍ MECHANIC GK8',
        'desc': 'Fabricado en metal, este juego de cuchillas es altamente duradero.',
        'uses': ['Mantenimiento de ordenadores', 'Limpieza de pegamento', 'Microelectrónica']
    },
    'MECH--379': {
        'title': 'BOTELLA DISPENSADORA SD150A MECHANIC',
        'desc': 'Dispensador de solventes y líquidos en general, diseño en vidrio transparente con núcleo metálico para mayor durabilidad.',
        'uses': ['Almacenar líquidos', 'Dispensador de Alcohol', 'Reparación de placas']
    },
    'MECH-061MECH-0.25MECH-0.75': {
        'title': 'ESFERAS DE ESTAÑO PARA REBALLING MECHANIC XZW25',
        'desc': 'Esferas de estaño de alta calidad para el proceso de reballing en circuitos integrados.',
        'uses': ['Reballing de memoria', 'Reparación BGA', 'Chips pequeños']
    },
    'MECH-178': {
        'title': 'CUCHILLAS FILO MECHANIC FR1',
        'desc': 'Acero al carbono, hoja de alta tenacidad y dureza superior. Evita quiebres al hacer palanca.',
        'uses': ['Cortar y raspar', 'Limpiar espacios reducidos', 'Separación de pantallas']
    },
    'MECH-185': {
        'title': 'DISPENSADOR DE PLASTICO MECHANIC 6 OZ',
        'desc': 'Dispensador en PVC antiestático azul con tapa de acero inoxidable. Ideal para almacenar líquidos nocivos de forma segura.',
        'uses': ['Alcohol Isopropílico', 'Líquidos en general', 'PVC antiestático']
    },
    'MECH-188': {
        'title': 'MECHANIC TF01-6 OZ (NARANJA)',
        'desc': 'Dispensadores de solventes color naranja en PVC antiestático, diseño a prueba de derrames.',
        'uses': ['Líquidos nocivos', 'Mantenimiento seguro', 'Antiestático']
    },
    'MECH-189': {
        'title': 'MECHANIC TF01-4 OZ (AZUL)',
        'desc': 'Dispensadores de solventes color azul en PVC antiestático, ideal para espacios compactos de trabajo.',
        'uses': ['Almacenar solventes', 'Uso técnico', 'Seguridad en laboratorio']
    },
    'MECH-201': {
        'title': 'KIT CUCHILLA DE REPARACIÓN MECHANIC 004',
        'desc': 'Kit fabricado con acero inoxidable, con diversas puntas intercambiables para labores de desgomado.',
        'uses': ['Cortes precisos en circuitos', 'Palanca de desgomado', 'Multifuncional']
    },
    'MECH-211': {
        'title': 'SET DE HERRAMIENTAS DE APERTURA MECHANIC MCNJGS-02',
        'desc': 'Set profesional con hilo de corte de acero al carbono y mangos antideslizantes para separación.',
        'uses': ['Separación de LCD/OLED', 'Corte de adhesivos', 'Uso profesional']
    },
    'MECH-219': {
        'title': 'CABLE DE CORTE PARA SEPARACIÓN DE LCD iLine',
        'desc': 'Cable de corte de alta resistencia fabricado con acero especial al carbón.',
        'uses': ['Pantallas OLED/Edge', 'Máxima precisión', 'Equilibrio y resistencia']
    },
    'MECH-221': {
        'title': 'CABLE DE CORTE MCNJGS-02 (ROLLO)',
        'desc': 'Hilo de acero al carbono ultra fino para la separación segura de paneles LCD.',
        'uses': ['Corte de pantallas', 'Gama alta', 'Alta dureza']
    },
    'MECH-262': {
        'title': 'ESTAÑO ALAMBRE MECHANIC SX-862',
        'desc': 'Rollo de soldadura de alta pureza (aleación 63% estaño y 37% plomo) con núcleo doble de resina (flux).',
        'uses': ['Soldaduras microscópicas', 'Trabajos de precisión', 'SMD comunes']
    },
    'MECH-274': {
        'title': 'ESTAÑO ALAMBRE MECHANIC TY-V866 0.4MM',
        'desc': 'Composición 63% estaño (Sn) y 37% plomo (Pb) con núcleo de resina fundente.',
        'uses': ['Microsoldadura avanzada', 'Reparación de pistas', 'Evita exceso de estaño']
    },
    'MECH-294': {
        'title': 'CUCHILLA DE REPARACIÓN MECHANIC 004',
        'desc': 'Hoja fina con recubrimiento para eliminación de pegamento en placas.',
        'uses': ['Raspar adhesivo', 'Limpieza de CPU', 'Microcomponentes']
    },
    'MECH-318': {
        'title': 'CUCHILLA DE REPARACIÓN MECHANIC 5',
        'desc': 'Juego de 5 navajas de hoja fina pulidas a mano para máxima precisión.',
        'uses': ['Eliminar pegamento de placas', 'Corte fino', 'Uso profesional']
    },
    'MECH-379': {
        'title': 'BOTELLA DISPENSADORA DE VIDRIO MECHANIC SD150A',
        'desc': 'Versión estándar de la botella de almacenamiento de vidrio SD150A.',
        'uses': ['Alcohol Isopropílico', 'Líquidos de limpieza', 'Núcleo metálico']
    },
    'MECH-401': {
        'title': 'PUNTA DE SOLDADURA ESD MECHANIC 900M-T-4C',
        'desc': 'Punta de soldadura sin plomo, diseñada para ofrecer precisión y durabilidad.',
        'uses': ['Componentes electrónicos', 'Reparación de placas', 'Trabajo detallado']
    },
    'MECH-432': {
        'title': 'PAÑO NANO BLACK 100 PCS',
        'desc': 'Paños de limpieza antiestáticos libres de polvo de la marca Mechanic (Nano High Clean Cloth Black).',
        'uses': ['Salas limpias', 'Mantenimiento técnico', 'Limpieza de pantallas']
    },
    'MECH-485': {
        'title': 'PUNTAS DE CAUTIN HUECA MECHANIC 900M-T-2.4D',
        'desc': 'Punta de soldadura cincel chico de 2.4mm, permite una excelente transferencia de calor.',
        'uses': ['Componentes medianos', 'Retirar pegamento', 'Desoldar']
    },
    'MECH-487': {
        'title': 'PUNTAS DE CAUTIN MECHANIC 900M-T-B',
        'desc': 'Punta fina clásica para estaciones de soldadura Mechanic.',
        'uses': ['Soldadura general', 'Repuestos', 'Precisión media']
    },
    'MECH-511': {
        'title': 'CABLE DE CORTE PARA SEPARACIÓN DE LCD CS01 0.03 MM',
        'desc': 'Cable de acero al carbono de alta dureza modelo CS01 de 100 metros. Ultra-fino.',
        'uses': ['Pantallas curvas', 'OLED delicadas', 'Evitar daños']
    },
    'MECH-577': {
        'title': 'PAÑOS ANTIPOLVO ANTIESTÁTICOS CLEANROOM WIPERS',
        'desc': 'Paños super suaves de material plástico de alta calidad (Cleanroom Wipers) que no dañan superficies.',
        'uses': ['Limpiar pantallas LCD', 'Vidrio trasero', 'Microelectrónica']
    },
    'MECH-632': {
        'title': 'CUCHILLAS DE DOBLE FILO MECHANIC FR2',
        'desc': 'Cuchillas profesionales de doble filo en acero inoxidable.',
        'uses': ['Cortar y raspar', 'Limpiar espacios reducidos', 'Alta durabilidad']
    },
    'MECH-633': {
        'title': 'KIT CUCHILLA DE DESMONTAJE MECHANIC KH-001',
        'desc': 'Fabricadas en acero inoxidable 304 con diseño de "presión y rebote" (tipo bolígrafo).',
        'uses': ['Mantenimiento de motherboard', 'Extracción de chips', 'Trabajo preciso']
    },
    'MECH-727': {
        'title': 'ESTAÑO ALAMBRE ECOLÓGICO MECHANIC HBD-366',
        'desc': 'Alambre de soldadura respetuoso con el medio ambiente, libre de impurezas y con alta eficiencia de fusión.',
        'uses': ['Soldadura ecológica', 'Alta precisión', 'Uso general']
    },
    'MECH-732': {
        'title': 'GOMAS PROTECTORAS PARA LENTES DE MICROSCOPIO',
        'desc': 'Cubiertas de goma ergonómicas para oculares de microscopios trinoculares y binoculares.',
        'uses': ['Protección ocular', 'Ergonomía', 'Trabajo prolongado']
    },
    'MECH-655': {
        'title': 'KIT DE CUCHILLAS MECHANIC QUICK EDGE 7',
        'desc': 'Juego de cuchillas de retrabajo integradas con mango resistente y 5 tipos de puntas (MODO-A a MODO-E).',
        'uses': ['Remover pegamento CPU', 'Extracción de IC', 'Múltiples puntas']
    }
}

# Regex to find each card body
def replace_card(match):
    body = match.group(0)
    # Find which ID is in the image src
    img_match = re.search(r'src="[^"]*?(MECH[-A-Z0-9\.]+)\.(png|webp|jpg)"', body, re.IGNORECASE)
    if not img_match:
        return body
        
    raw_id = img_match.group(1)
    
    # Clean up ID to match our keys (remove trailing dots, handle MMECH vs MECH)
    clean_id = raw_id.replace('MMECH', 'MECH').rstrip('.')
    
    if clean_id not in products:
        # Maybe it has dots in the dictionary? Let's just do a substring match
        matched_key = None
        for k in products:
            if clean_id in k or k in clean_id:
                matched_key = k
                break
        if not matched_key:
            return body # keep original if no match
        clean_id = matched_key

    data = products[clean_id]
    
    # Replace title
    body = re.sub(r'<h3 class="datasheet-title">.*?</h3>', f'<h3 class="datasheet-title">{data["title"]}</h3>', body, flags=re.DOTALL)
    
    # Replace description
    body = re.sub(r'<p class="datasheet-desc">.*?</p>', f'<p class="datasheet-desc">{data["desc"]}</p>', body, flags=re.DOTALL)
    
    # Replace pills
    pills_html = '\n'.join([f'                  <span class="use-pill">{u}</span>' for u in data['uses']])
    body = re.sub(r'<div class="datasheet-uses__pills">.*?</div>', f'<div class="datasheet-uses__pills">\n{pills_html}\n                </div>', body, flags=re.DOTALL)
    
    return body

new_content = re.sub(r'<div class="datasheet-card__body">.*?</div>\s*</div>', replace_card, content, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
    
print("Updated mechanic-ve.html successfully!")
