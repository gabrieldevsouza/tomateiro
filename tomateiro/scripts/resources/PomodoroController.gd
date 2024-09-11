extends Resource
class_name PomodoroController

enum PomodoroState {PREPARE, PLAY, PAUSE, STOP}

var state : PomodoroState = PomodoroState.PREPARE

@export var setup_focus_time : FloatVar

@export var setup_pomodoros_amount : IntVar

var user_focus_time : FloatVar

var real_cycles_amount : int = 0
var user_cycles_amount : IntVar

var remaining_seconds : FloatVar
var current_round_cycle : IntVar

var finish_iteration_time : float = 0
var start_iteration_time : float = 0.0

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
	
	prepare()

func initialize_values() -> void:
	if remaining_seconds.value <= 0:
		remaining_seconds.value = int(setup_focus_time.value)
	
	if current_round_cycle.value <= 0:
		current_round_cycle.value = 1

	if real_cycles_amount <= 0:
		real_cycles_amount = setup_pomodoros_amount.value

func load_resources() -> void:
	remaining_seconds = ResourceLoader.load("user://remaining_seconds.tres")

	current_round_cycle = ResourceLoader.load("user://current_round_cycle.tres")

	if remaining_seconds == null:
		remaining_seconds = FloatVar.new()
		remaining_seconds.value = 0
	
	if current_round_cycle == null:
		current_round_cycle = IntVar.new()
		current_round_cycle.value = 0

func prepare() -> void:
	prepare_signal.emit()
	state = PomodoroState.STOP

func play() -> void:
	if state == PomodoroState.PLAY:
		return

	start_iteration_time = Time.get_unix_time_from_system()
	finish_iteration_time = start_iteration_time + remaining_seconds.value

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
	
	var timeDifference = finish_iteration_time - currentTime
	
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
