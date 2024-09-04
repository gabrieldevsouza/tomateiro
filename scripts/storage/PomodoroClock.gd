extends Node

@export var pomodoro_timer_label : Label

@export var iterationTime : float = 0.5
var targetTime : float = 0
var startTime : float = 0.0

func _ready() -> void:
	pass

func _process(delta: float) -> void:
	# Get the current time in Unix format
	var currentTime = Time.get_unix_time_from_system()
	
	# Calculate the difference in seconds between the target time and the current time
	var timeDifference = targetTime - currentTime
	
	# If timeDifference is positive, calculate the minutes and seconds remaining
	if timeDifference > 0:
		var minutes = int(timeDifference / 60)
		var seconds = int(timeDifference) % 60  # Convert timeDifference to int before using modulus
		pomodoro_timer_label.set_text(str(minutes) + " : " + str(seconds) + "")
	else:
		# If the timeDifference is zero or negative, set text to indicate time is up
		pomodoro_timer_label.set_text("Time is up!")


func _on_btn_play_pressed() -> void:
	startTime = Time.get_unix_time_from_system()
	
	# Calculate the target time
	targetTime = startTime + iterationTime * 60
	
	print(Time.get_datetime_dict_from_unix_time(targetTime))