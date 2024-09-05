extends Node

@export var pomodoro_timer_label : Label

@export var play_btn : BaseButton
@export var repeat_btn : BaseButton

@export var focus_time : FloatVar
var remaining_seconds : FloatVar

var iteration_finish_time : float = 0
var startTime : float = 0.0

var is_running_time : bool = false


func _ready() -> void:
	play_btn.pressed.connect(_on_btn_play_pressed)
	repeat_btn.pressed.connect(_on_btn_repeat_pressed)

	remaining_seconds = ResourceLoader.load("user://remaining_seconds.tres")

	if remaining_seconds == null:
		remaining_seconds = FloatVar.new()
		remaining_seconds.value = 0

	if remaining_seconds.value > 0:
		pomodoro_timer_label.set_text(formart_time(remaining_seconds.value))
	else:
		pomodoro_timer_label.set_text(formart_time(focus_time.get_value()))

	print("remaining_seconds: ", focus_time.value)

func _process(_delta: float) -> void:
	if is_running_time:
		# Get the current time in Unix format
		var currentTime = Time.get_unix_time_from_system()
		
		# Calculate the difference in seconds between the target time and the current time
		var timeDifference = iteration_finish_time - currentTime
		
		# If timeDifference is positive, calculate the minutes and seconds remaining
		if timeDifference > 0:
			pomodoro_timer_label.set_text(formart_time(timeDifference))

			remaining_seconds.value = timeDifference
			ResourceSaver.save(remaining_seconds, "user://remaining_seconds.tres")
		else:
			# If the timeDifference is zero or negative, set text to indicate time is up
			pomodoro_timer_label.set_text("Time is up!")
			remaining_seconds.value = 0




func _on_btn_play_pressed() -> void:
	startTime = Time.get_unix_time_from_system()
	
	# Calculate the target time
	iteration_finish_time = startTime

	if remaining_seconds.value > 0:
		iteration_finish_time += remaining_seconds.value
	else:
		iteration_finish_time += focus_time.get_value()

	is_running_time = true


func _on_btn_repeat_pressed() -> void:
	is_running_time = false
	pomodoro_timer_label.set_text(formart_time(focus_time.get_value()))
	remaining_seconds.value = 0

func formart_time(time : float) -> String:
	var minutes = int(time / 60)
	var seconds = int(time) % 60 

	var formatted_time = str(minutes).pad_zeros(2) + ":" + str(seconds).pad_zeros(2)
	return formatted_time
