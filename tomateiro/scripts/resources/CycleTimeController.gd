extends Resource
class_name CycleTimeController

enum PomodoroState {PREPARE, PLAY, PAUSE, STOP}

var state : PomodoroState = PomodoroState.PREPARE

@export var setup_focus_time : FloatVar

@export var setup_pomodoros_amount : IntVar

var remaining_seconds : FloatVar

var finish_cycle_time : float = 0
var start_cycle_time : float = 0.0

var allow_user_play : bool = false

signal prepare_signal
signal play_signal
signal pause_signal
signal repeat_signal
signal tick_signal
signal finish_signal

func bootstrap() -> void:

	load_resources()

	initialize_values()
	
	# prepare()

func initialize_values() -> void:
	if remaining_seconds.value <= 0:
		remaining_seconds.value = int(setup_focus_time.value)


func load_resources() -> void:
	remaining_seconds = ResourceLoader.load("user://remaining_seconds.tres")

	if remaining_seconds == null:
		remaining_seconds = FloatVar.new()
		remaining_seconds.value = 0

func prepare() -> void:
	state = PomodoroState.STOP
	allow_user_play = true
	prepare_signal.emit()

func play() -> void:
	if state == PomodoroState.PLAY or not allow_user_play:
		return

	start_cycle_time = Time.get_unix_time_from_system()
	finish_cycle_time = start_cycle_time + remaining_seconds.value

	state = PomodoroState.PLAY

	play_signal.emit()

func pause() -> void:
	if not state == PomodoroState.PLAY:
		return
	
	pause_signal.emit()

func repeat() -> void:
	state = PomodoroState.STOP
	remaining_seconds.value = setup_focus_time.value

	repeat_signal.emit()

func finish () -> void:
	state = PomodoroState.STOP
	remaining_seconds.value = 0

	finish_signal.emit()

func tick_iteration() -> void:
	if not state == PomodoroState.PLAY:
		return
	
	var currentTime = Time.get_unix_time_from_system()
	
	var timeDifference = finish_cycle_time - currentTime
	
	if timeDifference > 0:
		remaining_seconds.value = timeDifference

		tick_signal.emit()
	else:
		remaining_seconds.value = int(0)
		finish()
	
	ResourceSaver.save(remaining_seconds, "user://remaining_seconds.tres")


func get_progress () -> float:
	print(remaining_seconds.value)
	print(remaining_seconds.value, " / ", setup_focus_time.value)
	return remaining_seconds.value / setup_focus_time.value
