from sqlite3 import OperationalError
from math import radians, cos, sin, asin, sqrt
import matplotlib.pyplot as plt
import sqlite3
import datetime

conn = sqlite3.connect('m7498_sledzbus.db')
c = conn.cursor()

# zacznij od 0:00, powtorz jakies 10 razy, znajdz w nastepnym ticku najblizszy autobus tej samej linii, powtórz dla niego

def load_file():
	#i = 0
	with open('bus_data.sql', 'r') as fd:
		bigCommand = ''
		for sqlCommand in fd:
			# you can modify this line to get % complete for big files
			#i += 1
			#line_count = 4919091
			#if i % line_count/100 == 0:
			#	print(str(i/line_count*100) + '%')
			bigCommand = bigCommand + sqlCommand
			# had to check two last chars for ; because sometimes it'd end with ' '
			if bigCommand[-1] == ';' or len(bigCommand) > 1 and bigCommand[-2] == ';':
				try:
					c.execute(bigCommand)
					bigCommand = ''
				except OperationalError as err:
					print("Error: "+str(err)+' line '+str(i))

def save_progress_to_file(filename, list_to_save):
	with open(filename, 'w') as file:
		for item in list_to_save:
			file.write("%s\n" % item)

def compute():
	start_name = '146'
	start_model = 11090064
	start_day = '18'
	minutes_ahead = 20
	result_list = get_data(name=start_name, model=start_model, day=start_day)
	print('number of results '+str(len(result_list)))
	for i in range(0, 20):
		print('looking for successor... '+str(i))
		# get last x, y and time
		x = result_list[-1][0]
		y = result_list[-1][1]
		createdAt = result_list[-1][3]
		# get all results from the same day
		print('getting results from the same day... ')
		result = c.execute("SELECT vp.x, vp.y, v.name, vp.createdAt, v.model FROM vehiclePositions vp \
			JOIN Vehicles v ON vp.VehicleId = v.Id WHERE v.name = '{}' AND substr(vp.createdAt, 9, 2) == '{}' AND vp.createdAt > '{}' ORDER BY vp.createdAt ASC".format(start_name, start_day, createdAt))
		# we need to know how many same dates are there next
		result = result.fetchall()
		small_result = [list(row) for row in result]
		how_many = 0
		for i in range(len(small_result)):
			if small_result[i][3] == small_result[0][3]:
				how_many += 1
			else:
				break
		# looking in the next tick is not enough, let's look 5 minutes into the future
		how_many *= minutes_ahead*6
		# now get all next ticks
		print('getting next ticks... ')
		result = c.execute("SELECT vp.x, vp.y, v.name, vp.createdAt, v.model FROM vehiclePositions vp \
			JOIN Vehicles v ON vp.VehicleId = v.Id WHERE v.name = '{}' AND substr(vp.createdAt, 9, 2) == '{}' AND vp.createdAt > '{}' ORDER BY vp.createdAt ASC LIMIT {}".format(start_name, start_day, createdAt, how_many))
		result = result.fetchall()
		small_result = [list(row) for row in result]
		# if no next ticks, end
		if len(small_result) == 0:
			return result_list
		# and find the one with shortest distance
		shortest_id = -1
		shortest_distance = 999999
		print('finding shortest distance successor... ')
		for i in range(len(small_result)):
			distance = haversine(small_result[i][1], small_result[i][0], y, x)
			if distance < shortest_distance:
				shortest_id = i
				shortest_distance = distance
		print('shortest id '+str(shortest_id)+' shortest distance '+str(shortest_distance))
		# now that we know the most likely successor, we get it's data
		print('beginning successor data getting... model='+str(small_result[shortest_id][-1]))
		to_append = get_data(name=start_name, model=small_result[shortest_id][-1], day=start_day, accumulated_km=result_list[-1][-1], createdAt=createdAt)
		if len(to_append) == 0:
			break
		result_list += to_append
		print('New length is ' + str(len(result_list)))
		save_progress_to_file('progress.txt', result_list)
	return result_list

def get_data(name, model, day, accumulated_km=0, createdAt='', is_test = False):
	# this part is here in case of doing machine learning
	'''row_count = c.execute("SELECT COUNT(*) FROM vehiclePositions vp JOIN Vehicles v ON vp.VehicleId = v.Id").fetchall()[0][0]
	if is_test:
		result = c.execute("SELECT vp.x, vp.y, v.name, vp.createdAt, v.model FROM vehiclePositions vp \
		JOIN Vehicles v ON vp.VehicleId = v.Id WHERE v.name = '148' AND v.model = 11110380  AND substr(vp.createdAt, 9, 2) = '26' ORDER BY vp.createdAt, v.name DESC LIMIT {}".format(int(row_count*0.3)))
	else:
		result = c.execute("SELECT vp.x, vp.y, v.name, vp.createdAt, v.model FROM vehiclePositions vp \
		JOIN Vehicles v ON vp.VehicleId = v.Id WHERE v.model = 11111423 ORDER BY vp.createdAt, v.name ASC LIMIT {}".format(int(row_count*0.7)))'''
	if createdAt:
		result = c.execute("SELECT vp.x, vp.y, v.name, vp.createdAt, v.model FROM vehiclePositions vp \
			JOIN Vehicles v ON vp.VehicleId = v.Id WHERE v.model = {} AND v.name = '{}' AND substr(vp.createdAt, 9, 2) == '{}' AND vp.createdAt > '{}' ORDER BY vp.createdAt, v.name ASC".format(model, name, day, createdAt))
	else:
		result = c.execute("SELECT vp.x, vp.y, v.name, vp.createdAt, v.model FROM vehiclePositions vp \
			JOIN Vehicles v ON vp.VehicleId = v.Id WHERE v.model = {} AND v.name = '{}' AND substr(vp.createdAt, 9, 2) == '{}' ORDER BY vp.createdAt, v.name ASC".format(model, name, day))
	#result = c.execute("SELECT v.Id, v.name, v.model FROM Vehicles v WHERE v.name = 'a' AND substr(v.createdAt, 9, 2) = '26'")
	#result = c.execute("SELECT v.name, v.model FROM Vehicles v WHERE substr(v.createdAt, 9, 2) == '26'")
	result = result.fetchall()
	# convert list of tuples to list of lists so that we can append later
	result_list = [list(row) for row in result]
	if len(result_list) == 0:
		return []
	#for item in result_list:
	#	print(item)
	# we don't need so much precision, and ploting so many points is impossible, so divide points by 2^x
	# we also have to make sure last result stays, so that it doesnt mess up compute function
	last_result = result_list[-1]
	x = 3
	for i in range(0, x):
		print('compressing results... '+str(i+1) + '/' + str(x))
		result_list = result_list[0::2]
	result_list.append(last_result)
	# get rid of retarded positions
	result_list = [item for item in result_list if item[0] < 1000]
	# add traveled distance to each row, basing on previous row
	print("adding distances...", end='')
	result_list[0].append(accumulated_km)
	for row in range(1, len(result_list)):
		result_list[row].append(haversine(result_list[row-1][1], result_list[row-1][0], result_list[row][1], result_list[row][0])+result_list[row-1][-1])
	print("success")
	#print("all results... " + str(len(result_list)))
	return result_list

def haversine(lon1, lat1, lon2, lat2):
	"""
	Calculate the great circle distance between two points 
	on the earth (specified in decimal degrees)
	"""
	# convert decimal degrees to radians 
	lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
	# haversine formula 
	dlon = lon2 - lon1 
	dlat = lat2 - lat1 
	a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
	c = 2 * asin(sqrt(a)) 
	# Radius of earth in kilometers is 6371
	km = 6371 * c
	return km

def plot(data):
	X = []
	Y = []
	for row in data:
		X.append(row[-1])
		Y.append(row[3])
	plt.plot(Y, X)
	plt.setp(plt.gca().get_xticklabels(), rotation=45, ha="right")
	i = 0
	print('hiding excessive labels... ', end='')
	for label in plt.gca().get_xticklabels():
		if i%20 != 0:
			label.set_visible(False)
		i += 1
	print('success')
	print('preparing plot...', end='')
	plt.show()

plot(compute())

'''result = c.execute("SELECT v.name, v.model, v.createdAt FROM Vehicles v WHERE v.name = '146' ORDER BY v.createdAt")
result = result.fetchall()
# convert list of tuples to list of lists so that we can append later
result_list = [list(row) for row in result]
for item in result_list:
	print(item)'''