@tool
extends AspectRatioContainer
class_name VStackableRatioContainer

@onready var container: BoxContainer = get_parent()

@export var ratio_limited_by_parent_height : bool = true

@export_range(0.001, 10) var stack_ratio : float = 1 :
	set(value):

		if container == null:
			container = get_parent()

		if container != null:
			if value * container.size.x > container.get_parent_area_size().y and ratio_limited_by_parent_height:
				value = container.get_parent_area_size().y / container.size.x

			stack_ratio = value
			compute()

@export_range(0.001, 1) var item_scale : float = 1.0 :
	set(value):
		item_scale = value
		compute()


func _ready() -> void:
	container = get_parent()
	resized.connect(compute)


func compute() -> void:
	if container == null:
		container = get_parent()
		if container == null:
			return
	custom_minimum_size.y = container.size.x * stack_ratio * item_scale