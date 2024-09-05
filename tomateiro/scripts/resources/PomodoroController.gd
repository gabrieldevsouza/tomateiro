extends Resource
class_name PomodoroController

@export var default_focus_time : FloatVar

@export var default_cycles_amount : IntVar

var user_focus_time : FloatVar

var user_cycles_amount : IntVar

var remaining_seconds : FloatVar

var finish_iteration_time : float = 0
var start_iteration_time : float = 0.0

var is_running_time : bool = false

signal prepare_signal
signal play_signal
signal pause_signal
signal repeat_signal
signal tick_signal
signal finish_signal

func bootstrap() -> void:

	remaining_seconds = ResourceLoader.load("user://remaining_seconds.tres")

	if remaining_seconds == null:
		remaining_seconds = FloatVar.new()
		remaining_seconds.value = 0

	if remaining_seconds.value <= 0:
		remaining_seconds.value = default_focus_time.value
	
	prepare_signal.emit()

func play() -> void:
	if is_running_time:
		return
	
	is_running_time = true

	start_iteration_time = Time.get_unix_time_from_system()
	finish_iteration_time = start_iteration_time + remaining_seconds.value

	play_signal.emit()

func pause() -> void:
	if not is_running_time:
		return
	
	is_running_time = false
	pause_signal.emit()

func repeat() -> void:
	is_running_time = false
	remaining_seconds.value = default_focus_time.value

	repeat_signal.emit()

func finish () -> void:
	is_running_time = false

	finish_signal.emit()

func tick_iteration() -> void:
	var currentTime = Time.get_unix_time_from_system()
	
	var timeDifference = finish_iteration_time - currentTime
	
	if timeDifference > 0:
		remaining_seconds.value = timeDifference
		ResourceSaver.save(remaining_seconds, "user://remaining_seconds.tres")

		tick_signal.emit()
	else:
		remaining_seconds.value = 0
		finish()